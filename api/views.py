from django.db.models import Q
from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from drf_spectacular.utils import extend_schema

from .models import Member, Ad, ChatThread, Message
from .serializers import (
    RegisterSerializer,
    LoginSerializer,
    MemberMeSerializer,
    MemberUpdateSerializer,
    MemberPublicSerializer,
    AdSerializer,
    AdCreateUpdateSerializer,
    ChatThreadSerializer,
    MessageSerializer,
    MessageCreateSerializer,
)
from .authentication import create_jwt


class RegisterView(APIView):
    @extend_schema(request=RegisterSerializer, responses={201: MemberMeSerializer})
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        member = serializer.save()
        return Response(MemberMeSerializer(member).data, status=status.HTTP_201_CREATED)


class LoginView(APIView):
    @extend_schema(request=LoginSerializer, responses={200: dict})
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        email = serializer.validated_data["email"]
        password = serializer.validated_data["password"]
        try:
            member = Member.objects.get(email=email)
        except Member.DoesNotExist:
            return Response({"detail": "Неверный email или пароль"}, status=status.HTTP_400_BAD_REQUEST)
        if not member.check_password(password):
            return Response({"detail": "Неверный email или пароль"}, status=status.HTTP_400_BAD_REQUEST)
        token = create_jwt(member.id)
        return Response({
            "token": token,
            "member": MemberMeSerializer(member).data,
        })


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(responses={200: MemberMeSerializer})
    def get(self, request):
        return Response(MemberMeSerializer(request.user).data)

    @extend_schema(request=MemberUpdateSerializer, responses={200: MemberMeSerializer})
    def put(self, request):
        serializer = MemberUpdateSerializer(instance=request.user, data=request.data, partial=False)
        if not serializer.is_valid():
            return Response(serializer.errors, status=400)
        serializer.save()
        return Response(MemberMeSerializer(request.user).data)


class MemberDetailView(APIView):
    @extend_schema(responses={200: MemberPublicSerializer})
    def get(self, request, member_id: int):
        try:
            member = Member.objects.get(id=member_id)
        except Member.DoesNotExist:
            return Response({"detail": "Пользователь не найден"}, status=404)
        return Response(MemberPublicSerializer(member).data)


class AdsListCreateView(APIView):
    @extend_schema(responses={200: AdSerializer})
    def get(self, request):
        qs = Ad.objects.select_related("author").all().order_by("-created_at")
        category = request.query_params.get("category")
        q = request.query_params.get("q")
        price_min = request.query_params.get("price_min")
        price_max = request.query_params.get("price_max")
        date_from = request.query_params.get("date_from")
        date_to = request.query_params.get("date_to")

        if category in {"auto", "realty"}:
            qs = qs.filter(category=category)
        if q:
            qs = qs.filter(title__icontains=q)
        if price_min:
            try:
                qs = qs.filter(price__gte=float(price_min))
            except ValueError:
                pass
        if price_max:
            try:
                qs = qs.filter(price__lte=float(price_max))
            except ValueError:
                pass
        if date_from:
            try:
                qs = qs.filter(created_at__date__gte=date_from)
            except Exception:
                pass
        if date_to:
            try:
                qs = qs.filter(created_at__date__lte=date_to)
            except Exception:
                pass

        # Simple pagination
        try:
            page = int(request.query_params.get("page", 1))
        except ValueError:
            page = 1
        try:
            page_size = int(request.query_params.get("page_size", 20))
        except ValueError:
            page_size = 20
        start = (page - 1) * page_size
        end = start + page_size
        total = qs.count()
        items = qs[start:end]
        data = {
            "count": total,
            "page": page,
            "page_size": page_size,
            "results": AdSerializer(items, many=True).data,
        }
        return Response(data)

    permission_classes = [IsAuthenticated]

    @extend_schema(request=AdCreateUpdateSerializer, responses={201: AdSerializer})
    def post(self, request):
        serializer = AdCreateUpdateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=400)
        ad = serializer.save(author=request.user)
        return Response(AdSerializer(ad).data, status=201)


class AdDetailView(APIView):
    @extend_schema(responses={200: AdSerializer})
    def get(self, request, ad_id: int):
        try:
            ad = Ad.objects.select_related("author").get(id=ad_id)
        except Ad.DoesNotExist:
            return Response({"detail": "Объявление не найдено"}, status=404)
        return Response(AdSerializer(ad).data)

    permission_classes = [IsAuthenticated]

    @extend_schema(request=AdCreateUpdateSerializer, responses={200: AdSerializer})
    def put(self, request, ad_id: int):
        try:
            ad = Ad.objects.get(id=ad_id)
        except Ad.DoesNotExist:
            return Response({"detail": "Объявление не найдено"}, status=404)
        if request.user.id != ad.author_id:
            return Response({"detail": "Доступ запрещен"}, status=403)
        serializer = AdCreateUpdateSerializer(instance=ad, data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=400)
        ad = serializer.save()
        return Response(AdSerializer(ad).data)

    def delete(self, request, ad_id: int):
        try:
            ad = Ad.objects.get(id=ad_id)
        except Ad.DoesNotExist:
            return Response({"detail": "Объявление не найдено"}, status=404)
        if request.user.id != ad.author_id:
            return Response({"detail": "Доступ запрещен"}, status=403)
        ad.delete()
        return Response(status=204)


class ChatThreadsView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(responses={200: ChatThreadSerializer})
    def get(self, request):
        me = request.user
        threads = ChatThread.objects.select_related("user1", "user2").filter(Q(user1=me) | Q(user2=me)).order_by("-created_at")
        return Response(ChatThreadSerializer(threads, many=True).data)

    @extend_schema(request=dict, responses={201: ChatThreadSerializer})
    def post(self, request):
        me = request.user
        recipient_id = request.data.get("recipient_id")
        ad_id = request.data.get("ad_id")
        if not recipient_id:
            return Response({"detail": "recipient_id обязателен"}, status=400)
        if int(recipient_id) == me.id:
            return Response({"detail": "Нельзя создать чат с самим собой"}, status=400)
        try:
            other = Member.objects.get(id=recipient_id)
        except Member.DoesNotExist:
            return Response({"detail": "Пользователь не найден"}, status=404)
        thread = None
        base_filter = Q(user1=me, user2=other) | Q(user1=other, user2=me)
        if ad_id:
            try:
                ad = Ad.objects.get(id=ad_id)
            except Ad.DoesNotExist:
                return Response({"detail": "Объявление не найдено"}, status=404)
            thread = ChatThread.objects.filter(base_filter, ad=ad).first()
            if not thread:
                thread = ChatThread.objects.create(user1=me, user2=other, ad=ad)
        else:
            thread = ChatThread.objects.filter(base_filter, ad__isnull=True).first()
            if not thread:
                thread = ChatThread.objects.create(user1=me, user2=other, ad=None)
        return Response(ChatThreadSerializer(thread).data, status=201)


class ThreadMessagesView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(responses={200: MessageSerializer})
    def get(self, request, thread_id: int):
        me = request.user
        try:
            thread = ChatThread.objects.get(id=thread_id)
        except ChatThread.DoesNotExist:
            return Response({"detail": "Чат не найден"}, status=404)
        if me.id not in [thread.user1_id, thread.user2_id]:
            return Response({"detail": "Доступ запрещен"}, status=403)
        msgs = thread.messages.select_related("sender").order_by("created_at")
        return Response(MessageSerializer(msgs, many=True).data)

    @extend_schema(request=MessageCreateSerializer, responses={201: MessageSerializer})
    def post(self, request, thread_id: int):
        me = request.user
        try:
            thread = ChatThread.objects.get(id=thread_id)
        except ChatThread.DoesNotExist:
            return Response({"detail": "Чат не найден"}, status=404)
        if me.id not in [thread.user1_id, thread.user2_id]:
            return Response({"detail": "Доступ запрещен"}, status=403)
        serializer = MessageCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=400)
        msg = Message.objects.create(thread=thread, sender=me, text=serializer.validated_data["text"])
        return Response(MessageSerializer(msg).data, status=201)


# Keep the hello view
from drf_spectacular.utils import extend_schema
from .serializers import MemberPublicSerializer as _Dummy  # avoid unused imports warning
from django.utils import timezone

class HelloView(APIView):
    @extend_schema(responses={200: dict}, description="Get a hello world message")
    def get(self, request):
        return Response({"message": "Hello!", "timestamp": timezone.now()})

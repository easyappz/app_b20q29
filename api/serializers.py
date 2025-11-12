from rest_framework import serializers
from .models import Member, Ad, ChatThread, Message


class MemberPublicSerializer(serializers.ModelSerializer):
    class Meta:
        model = Member
        fields = ["id", "name", "avatar_url", "phone", "about", "date_joined"]


class MemberMeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Member
        fields = ["id", "email", "name", "avatar_url", "phone", "about", "date_joined"]
        read_only_fields = ["id", "email", "date_joined"]


class MemberUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Member
        fields = ["name", "avatar_url", "phone", "about"]


class RegisterSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(min_length=6, write_only=True)
    name = serializers.CharField(max_length=120)

    def validate_email(self, value):
        if Member.objects.filter(email=value).exists():
            raise serializers.ValidationError("Пользователь с таким email уже существует")
        return value

    def create(self, validated_data):
        member = Member(
            email=validated_data["email"],
            name=validated_data["name"],
        )
        member.set_password(validated_data["password"])
        member.save()
        return member


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)


class AdSerializer(serializers.ModelSerializer):
    author = MemberPublicSerializer(read_only=True)

    class Meta:
        model = Ad
        fields = [
            "id",
            "title",
            "description",
            "price",
            "category",
            "phone",
            "condition",
            "created_at",
            "updated_at",
            "author",
        ]
        read_only_fields = ["id", "created_at", "updated_at", "author"]


class AdCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ad
        fields = ["title", "description", "price", "category", "phone", "condition"]


class ChatThreadSerializer(serializers.ModelSerializer):
    user1 = MemberPublicSerializer(read_only=True)
    user2 = MemberPublicSerializer(read_only=True)
    ad = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = ChatThread
        fields = ["id", "user1", "user2", "ad", "created_at"]


class MessageSerializer(serializers.ModelSerializer):
    sender = MemberPublicSerializer(read_only=True)

    class Meta:
        model = Message
        fields = ["id", "thread", "sender", "text", "created_at", "is_read"]
        read_only_fields = ["id", "thread", "sender", "created_at"]


class MessageCreateSerializer(serializers.Serializer):
    text = serializers.CharField()

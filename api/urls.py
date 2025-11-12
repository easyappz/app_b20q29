from django.urls import path
from .views import (
    HelloView,
    RegisterView,
    LoginView,
    MeView,
    MemberDetailView,
    AdsListCreateView,
    AdDetailView,
    ChatThreadsView,
    ThreadMessagesView,
)

urlpatterns = [
    path("hello/", HelloView.as_view(), name="hello"),

    # Auth
    path("auth/register/", RegisterView.as_view(), name="auth-register"),
    path("auth/login/", LoginView.as_view(), name="auth-login"),

    # Members
    path("members/me/", MeView.as_view(), name="members-me"),
    path("members/<int:member_id>/", MemberDetailView.as_view(), name="members-detail"),

    # Ads
    path("ads/", AdsListCreateView.as_view(), name="ads-list-create"),
    path("ads/<int:ad_id>/", AdDetailView.as_view(), name="ads-detail"),

    # Chat
    path("chat/threads/", ChatThreadsView.as_view(), name="chat-threads"),
    path("chat/threads/<int:thread_id>/messages/", ThreadMessagesView.as_view(), name="chat-thread-messages"),
]

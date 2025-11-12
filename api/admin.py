from django.contrib import admin
from .models import Member, Ad, ChatThread, Message


@admin.register(Member)
class MemberAdmin(admin.ModelAdmin):
    list_display = ("id", "email", "name", "date_joined")
    search_fields = ("email", "name")


@admin.register(Ad)
class AdAdmin(admin.ModelAdmin):
    list_display = ("id", "title", "category", "price", "author", "created_at")
    list_filter = ("category", "condition")
    search_fields = ("title",)


@admin.register(ChatThread)
class ChatThreadAdmin(admin.ModelAdmin):
    list_display = ("id", "user1", "user2", "ad", "created_at")


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ("id", "thread", "sender", "created_at", "is_read")

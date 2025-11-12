from django.db import models
from django.contrib.auth.hashers import make_password, check_password


class Member(models.Model):
    email = models.EmailField(unique=True)
    name = models.CharField(max_length=120)
    avatar_url = models.URLField(blank=True, default="")
    phone = models.CharField(max_length=32, blank=True, default="")
    about = models.TextField(blank=True, default="")
    date_joined = models.DateTimeField(auto_now_add=True)
    password = models.CharField(max_length=128)

    def set_password(self, raw_password: str) -> None:
        self.password = make_password(raw_password)

    def check_password(self, raw_password: str) -> bool:
        return check_password(raw_password, self.password)

    @property
    def is_authenticated(self) -> bool:  # for DRF permissions compatibility
        return True

    def __str__(self) -> str:
        return f"{self.name} <{self.email}>"


class Ad(models.Model):
    CATEGORY_CHOICES = (
        ("auto", "Автомобили"),
        ("realty", "Недвижимость"),
    )
    CONDITION_CHOICES = (
        ("new", "Новый"),
        ("used", "Б/У"),
    )

    author = models.ForeignKey(Member, on_delete=models.CASCADE, related_name="ads")
    title = models.CharField(max_length=200)
    description = models.TextField()
    price = models.DecimalField(max_digits=12, decimal_places=2)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    phone = models.CharField(max_length=32)
    condition = models.CharField(max_length=10, choices=CONDITION_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self) -> str:
        return f"{self.title} ({self.get_category_display()})"


class ChatThread(models.Model):
    user1 = models.ForeignKey(Member, on_delete=models.CASCADE, related_name="threads_as_user1")
    user2 = models.ForeignKey(Member, on_delete=models.CASCADE, related_name="threads_as_user2")
    ad = models.ForeignKey(Ad, on_delete=models.SET_NULL, null=True, blank=True, related_name="threads")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user1", "user2", "ad")

    def participants(self):
        return [self.user1_id, self.user2_id]

    def __str__(self) -> str:
        return f"Thread {self.id}: {self.user1_id}-{self.user2_id} ad={self.ad_id}"


class Message(models.Model):
    thread = models.ForeignKey(ChatThread, on_delete=models.CASCADE, related_name="messages")
    sender = models.ForeignKey(Member, on_delete=models.CASCADE, related_name="messages")
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)

    def __str__(self) -> str:
        return f"Msg {self.id} in {self.thread_id} by {self.sender_id}"

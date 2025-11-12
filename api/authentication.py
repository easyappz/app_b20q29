from datetime import datetime, timedelta
from typing import Optional, Tuple

import jwt
from django.conf import settings
from rest_framework.authentication import BaseAuthentication, get_authorization_header
from rest_framework import exceptions

from .models import Member

ALGORITHM = "HS256"
TOKEN_TTL_DAYS = 7


def create_jwt(member_id: int) -> str:
    now = datetime.utcnow()
    payload = {
        "sub": member_id,
        "iat": now,
        "exp": now + timedelta(days=TOKEN_TTL_DAYS),
        "type": "access",
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=ALGORITHM)


def decode_jwt(token: str) -> dict:
    return jwt.decode(token, settings.SECRET_KEY, algorithms=[ALGORITHM])


class MemberJWTAuthentication(BaseAuthentication):
    keyword = "Bearer"

    def authenticate(self, request) -> Optional[Tuple[Member, str]]:
        auth_header = get_authorization_header(request).decode("utf-8")
        if not auth_header:
            return None
        parts = auth_header.split()
        if len(parts) != 2 or parts[0].lower() != self.keyword.lower():
            return None
        token = parts[1]
        try:
            payload = decode_jwt(token)
        except jwt.ExpiredSignatureError:
            raise exceptions.AuthenticationFailed("Token expired")
        except jwt.InvalidTokenError:
            raise exceptions.AuthenticationFailed("Invalid token")

        member_id = payload.get("sub")
        if not member_id:
            raise exceptions.AuthenticationFailed("Invalid payload")
        try:
            member = Member.objects.get(id=member_id)
        except Member.DoesNotExist:
            raise exceptions.AuthenticationFailed("User not found")
        return (member, token)

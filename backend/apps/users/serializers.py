from django.contrib.auth import authenticate, get_user_model
from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken

from apps.shops.models import Shop, ShopMember

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    role = serializers.SerializerMethodField()
    shop_id = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ('id', 'email', 'username', 'first_name', 'last_name', 'phone', 'role', 'shop_id')

    def get_role(self, user):
        membership = user.memberships.select_related('shop').first()
        return membership.role if membership else None

    def get_shop_id(self, user):
        membership = user.memberships.select_related('shop').first()
        return membership.shop_id if membership else None


class RegisterSerializer(serializers.Serializer):
    email = serializers.EmailField()
    username = serializers.CharField(max_length=150)
    password = serializers.CharField(write_only=True, min_length=8)
    first_name = serializers.CharField(required=False, allow_blank=True)
    last_name = serializers.CharField(required=False, allow_blank=True)
    phone = serializers.CharField(required=False, allow_blank=True)
    shop_name = serializers.CharField(max_length=160)

    def create(self, validated_data):
        shop_name = validated_data.pop('shop_name')
        password = validated_data.pop('password')
        user = User.objects.create_user(password=password, **validated_data)
        shop = Shop.objects.create(name=shop_name, owner=user)
        ShopMember.objects.create(shop=shop, user=user, role=ShopMember.OWNER)
        return user

    def to_representation(self, user):
        refresh = RefreshToken.for_user(user)
        return {'access': str(refresh.access_token), 'refresh': str(refresh)}


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        user = authenticate(username=attrs['email'], password=attrs['password'])
        if not user:
            raise serializers.ValidationError('Invalid email or password.')
        if not user.is_active:
            raise serializers.ValidationError('Account is inactive.')
        refresh = RefreshToken.for_user(user)
        return {'access': str(refresh.access_token), 'refresh': str(refresh)}

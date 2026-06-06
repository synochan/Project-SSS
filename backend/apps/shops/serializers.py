from rest_framework import serializers

from .models import Shop, ShopMember


class ShopMemberSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source='user.email', read_only=True)
    username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = ShopMember
        fields = ('id', 'shop', 'user', 'email', 'username', 'role')


class ShopSerializer(serializers.ModelSerializer):
    members = ShopMemberSerializer(many=True, read_only=True)

    class Meta:
        model = Shop
        fields = ('id', 'name', 'address', 'contact_number', 'owner', 'members', 'created_at', 'updated_at')
        read_only_fields = ('owner',)

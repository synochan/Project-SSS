from rest_framework.permissions import BasePermission


class IsOwner(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.memberships.filter(role='OWNER').exists()


def user_shop_ids(user):
    return user.memberships.values_list('shop_id', flat=True)


def user_is_owner_for_shop(user, shop_id):
    return user.memberships.filter(shop_id=shop_id, role='OWNER').exists()

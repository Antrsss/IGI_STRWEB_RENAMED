from django.shortcuts import render, get_object_or_404, redirect
from zoo.models import TicketType, Cart, CartItem

def ticket_detail(request, id):
    ticket = get_object_or_404(TicketType, id=id)
    return render(request, "tickets/detail.html", {"ticket": ticket})

def add_to_cart(request, id):
    if not request.user.is_authenticated:
        return redirect("login")

    ticket = get_object_or_404(TicketType, id=id)
    cart, created = Cart.objects.get_or_create(user=request.user, is_paid=False)

    item, created = CartItem.objects.get_or_create(cart=cart, ticket_type=ticket)
    if not created:
        item.quantity += 1
        item.save()

    return redirect("cart")

def remove_from_cart(request, id):
    if not request.user.is_authenticated:
        return redirect("login")

    cart = get_object_or_404(Cart, user=request.user, is_paid=False)
    item = get_object_or_404(CartItem, cart=cart, ticket_type_id=id)

    if item.quantity > 1:
        item.quantity -= 1
        item.save()
    else:
        item.delete()

    return redirect("cart")


def delete_from_cart(request, id):
    if not request.user.is_authenticated:
        return redirect("login")

    cart = get_object_or_404(Cart, user=request.user, is_paid=False)
    item = get_object_or_404(CartItem, cart=cart, ticket_type_id=id)
    item.delete()

    return redirect("cart")

def cart_view(request):
    if not request.user.is_authenticated:
        return redirect("login")

    cart, created = Cart.objects.get_or_create(user=request.user, is_paid=False)
    return render(request, "tickets/cart.html", {"cart": cart})

def checkout(request):
    if not request.user.is_authenticated:
        return redirect("login")

    cart = get_object_or_404(Cart, user=request.user, is_paid=False)
    if request.method == "POST":
        # Здесь логика оплаты (пока просто отмечаем как оплачено)
        cart.is_paid = True
        cart.save()
        return render(request, "tickets/checkout_success.html", {"cart": cart})

    return render(request, "tickets/checkout.html", {"cart": cart})
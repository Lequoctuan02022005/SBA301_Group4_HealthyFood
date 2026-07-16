package backend.dto;

import backend.model.Cart;
import backend.model.Product;
import backend.model.User;


public class AddCartDto {
    public User customer;

    public Product product;

    public Integer quantity;

    public Cart toCart(){
        Cart cart = new Cart();
        cart.setProduct(this.product);
        cart.setCustomer(this.customer);
        cart.setQuantity(this.quantity);
        return cart;
    }
}

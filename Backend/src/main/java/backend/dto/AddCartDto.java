package backend.dto;

import backend.model.Cart;
import backend.model.Product;

public class AddCartDto {
    public Long productId;
    public int quantity;

    public Cart toCard(long userId){
        Cart cart = new Cart();
        cart.setQuantity(quantity);
        return cart;
    }
}

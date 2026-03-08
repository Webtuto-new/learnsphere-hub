import { useAuth } from "@/contexts/AuthContext";
import { useCart, CartItem } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ShoppingCart, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Props {
  type: "class" | "recording" | "bundle";
  itemId: string;
  price: number;
  title: string;
  currency?: string;
  thumbnail_url?: string | null;
}

const PurchaseButton = ({ type, itemId, price, title, currency = "LKR", thumbnail_url }: Props) => {
  const { user } = useAuth();
  const { addItem, isInCart } = useCart();
  const { toast } = useToast();
  const navigate = useNavigate();

  const inCart = isInCart(itemId);

  const handleAdd = () => {
    if (!user) { navigate("/login"); return; }
    if (price === 0) {
      // Free items - go directly to enroll (handled separately if needed)
      navigate("/checkout");
      return;
    }
    const item: CartItem = { id: itemId, type, title, price, currency, thumbnail_url };
    addItem(item);
    toast({ title: "Added to cart!", description: title });
  };

  if (inCart) {
    return (
      <Button size="lg" variant="outline" className="w-full gap-2" onClick={() => navigate("/checkout")}>
        <Check className="w-4 h-4" /> In Cart — Go to Checkout
      </Button>
    );
  }

  return (
    <Button size="lg" className="w-full gap-2" onClick={handleAdd}>
      <ShoppingCart className="w-4 h-4" /> Add to Cart — {currency} {price.toLocaleString()}
    </Button>
  );
};

export default PurchaseButton;

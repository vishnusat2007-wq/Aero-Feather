import { ProductForm } from "@/components/admin/product-form";

export default function NewProductPage() {
  return (
    <div>
      <h1 className="mb-8 text-3xl font-bold text-navy">Add product</h1>
      <ProductForm />
    </div>
  );
}

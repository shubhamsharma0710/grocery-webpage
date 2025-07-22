import { useEffect, useState } from "react";
import { useAppContext } from "../context/appContext";
import { Link, useParams } from "react-router-dom";
import { assets, imageMap } from "../assets/assets";
import ProductCard from "../components/ProductCard";

// ✅ Safe helper to extract image key
const getImageKey = (path) => {
  if (!path || typeof path !== "string") return "";
  const filename = path.split("/").pop(); // e.g., "potato_image_1.png"
  return filename.replace(/\.[^/.]+$/, ""); // "potato_image_1"
};

const SingleProduct = () => {
  const { products, navigate, addToCart } = useAppContext();
  const { id } = useParams();
  const [mainImage, setMainImage] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);

  const product = products.find((p) => p._id === id);

  useEffect(() => {
    if (products.length > 0 && product) {
      const filtered = products
        .filter((p) => p.category === product.category && p._id !== product._id)
        .slice(0, 5);
      setRelatedProducts(filtered);
    }
  }, [products, product]);

  useEffect(() => {
    if (product?.image?.[0]) {
      setMainImage(product.image[0]);
    }
  }, [product]);

  if (!product) return <p className="mt-16">Product not found.</p>;

  const resolvedMainImage = imageMap[getImageKey(mainImage)] || "/placeholder.png";

  return (
    <div className="mt-16">
      <p>
        <Link to="/">Home</Link> / <Link to="/products">Products</Link> /{" "}
        <Link to={`/products/${product.category.toLowerCase()}`}>
          {product.category}
        </Link>{" "}
        / <span className="text-indigo-500">{product.name}</span>
      </p>

      <div className="flex flex-col md:flex-row gap-16 mt-4">
        <div className="flex gap-3">
          {/* Thumbnails */}
          <div className="flex flex-col gap-3">
            {product.image?.map((img, index) => {
              const imgSrc = imageMap[getImageKey(img)];
              return (
                <div
                  key={index}
                  onClick={() => setMainImage(img)}
                  className="border max-w-24 border-gray-500/30 rounded overflow-hidden cursor-pointer"
                >
                  <img
                    src={imgSrc || "/placeholder.png"}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-auto"
                  />
                </div>
              );
            })}
          </div>

          {/* Main image */}
          <div className="border border-gray-500/30 max-w-100 rounded overflow-hidden">
            <img
              src={resolvedMainImage}
              alt="Selected product"
              className="w-full h-auto"
            />
          </div>
        </div>

        <div className="text-sm w-full md:w-1/2">
          <h1 className="text-3xl font-medium">{product.name}</h1>

          <div className="flex items-center gap-0.5 mt-1">
            {Array(5)
              .fill("")
              .map((_, i) => (
                <img
                  src={
                    i < Math.floor(product.rating)
                      ? assets.star_icon
                      : assets.star_dull_icon
                  }
                  alt="star"
                  key={i}
                  className="w-4"
                />
              ))}
            <p className="ml-2">({product.rating})</p>
          </div>

          <div className="mt-6">
            <p className="text-gray-500/70 line-through">
              MRP: ${product.price}
            </p>
            <p className="text-2xl font-medium">MRP: ${product.offerPrice}</p>
            <span className="text-gray-500/70">(inclusive of all taxes)</span>
          </div>

          <p className="text-base font-medium mt-6">About Product</p>
          <ul className="list-disc ml-4 text-gray-500/70">
            {product.description.map((desc, index) => (
              <li key={index}>{desc}</li>
            ))}
          </ul>

          <div className="flex items-center mt-10 gap-4 text-base">
            <button
              onClick={() => addToCart(product._id)}
              className="w-full py-3.5 bg-gray-100 hover:bg-gray-200 transition"
            >
              Add to Cart
            </button>
            <button
              onClick={() => {
                addToCart(product._id);
                navigate("/cart");
                scrollTo(0, 0);
              }}
              className="w-full py-3.5 bg-indigo-500 text-white hover:bg-indigo-600 transition"
            >
              Buy now
            </button>
          </div>
        </div>
      </div>

      {/* Related Products */}
      <div className="flex flex-col items-center mt-20">
        <div className="flex flex-col items-center w-max">
          <p className="text-2xl font-medium">Related Products</p>
          <div className="w-20 h-0.5 bg-primary rounded-full mt-2"></div>
        </div>

        <div className="my-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {relatedProducts
            .filter((rp) => rp.inStock)
            .map((rp, index) => (
              <ProductCard key={index} product={rp} />
            ))}
        </div>

        <button
          onClick={() => {
            navigate("/products");
            scrollTo(0, 0);
          }}
          className="w-1/2 my-8 py-3.5 bg-indigo-500 text-white hover:bg-indigo-600 transition"
        >
          See More
        </button>
      </div>
    </div>
  );
};

export default SingleProduct;

"use client";

import { useState } from "react";
import Header from "@/components/layout/Header";
import Navigation from "@/components/layout/Navigation";
import Container from "@/components/layout/Container";
import ProductList from "@/components/features/products/ProductList";
import AdjustmentTable from "@/components/features/adjustments/AdjustmentTable";
import ProductModal from "@/components/features/products/ProductModal";
import ProductDetailModal from "@/components/features/products/ProductDetailModal";
import AdjustmentModal from "@/components/features/adjustments/AdjustmentModal";

export default function Home() {
  const [activeTab, setActiveTab] = useState("products");

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Container className="py-6">
        <Navigation activeTab={activeTab} onTabChange={setActiveTab} />

        <main className="mt-8">
          {activeTab === "products" && <ProductList />}
          {activeTab === "adjustments" && <AdjustmentTable />}
        </main>
      </Container>
      {/* All Modals - Always rendered */}
      <ProductModal />
      <ProductDetailModal />
      <AdjustmentModal />
    </div>
  );
}

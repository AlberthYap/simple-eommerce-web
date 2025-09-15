export default function Navigation({ activeTab, onTabChange }) {
  const tabs = [
    { id: "products", name: "Products" },
    { id: "adjustments", name: "Adjustments" },
  ];

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="flex space-x-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`py-4 px-1 border-b-2 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.name}
          </button>
        ))}
      </div>
    </nav>
  );
}

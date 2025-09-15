import Container from "./Container";

export default function Header() {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <Container>
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">IM</span>
            </div>
            <div className="ml-3">
              <h1 className="text-lg font-semibold text-gray-900">
                Inventory Manager
              </h1>
            </div>
          </div>
        </div>
      </Container>
    </header>
  );
}

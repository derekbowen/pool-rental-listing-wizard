import { ListingProvider, useListing } from "@/contexts/ListingContext";
import ListingWizard from "@/components/listing/ListingWizard";
import ListingProductPage from "@/components/listing/ListingProductPage";
import ListingCard from "@/components/listing/ListingCard";

function PageRouter() {
  const { page, setPage, draft } = useListing();

  if (page === "product") {
    return <ListingProductPage onBack={() => setPage("wizard")} />;
  }

  if (page === "cards") {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-slate-800">Search Results Preview</h1>
            <button
              onClick={() => setPage("wizard")}
              className="text-sm text-cyan-600 hover:text-cyan-700 font-medium"
            >
              Back to Editor
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Current draft as a card */}
            <ListingCard
              title={draft.title || "Your Pool Listing"}
              coverPhotos={draft.images.map((i) => i.preview)}
              pricePerHour={draft.pricing.basePrice}
              isNew
              distance="0.5 mi"
              location={draft.location.address || "Your Location"}
              maxGuests={draft.publicData.guestallowed}
              instantBooking={draft.pricing.instantBooking}
              category={draft.category}
              onClick={() => setPage("product")}
            />
            {/* Mock nearby listings for context */}
            <ListingCard
              title="Heated Oasis with Waterfall"
              coverPhotos={[]}
              pricePerHour={7500}
              rating={4.9}
              reviewCount={124}
              distance="1.8 mi"
              location="Austin, TX"
              maxGuests={15}
              instantBooking
              category="Heated Pool"
            />
            <ListingCard
              title="Luxury Infinity Pool & Cabana"
              coverPhotos={[]}
              pricePerHour={12000}
              rating={4.7}
              reviewCount={89}
              distance="3.2 mi"
              location="Austin, TX"
              maxGuests={20}
              category="Infinity Pool"
            />
            <ListingCard
              title="Backyard Pool Party Setup"
              coverPhotos={[]}
              pricePerHour={3500}
              rating={4.5}
              reviewCount={56}
              distance="4.1 mi"
              location="Round Rock, TX"
              maxGuests={10}
              instantBooking
              category="Standard Pool"
            />
            <ListingCard
              title="Saltwater Pool with Hot Tub"
              coverPhotos={[]}
              pricePerHour={6500}
              isNew
              distance="5.7 mi"
              location="Cedar Park, TX"
              maxGuests={12}
              category="Saltwater"
            />
            <ListingCard
              title="Olympic Lap Pool Access"
              coverPhotos={[]}
              pricePerHour={2500}
              rating={4.8}
              reviewCount={201}
              distance="6.3 mi"
              location="Pflugerville, TX"
              maxGuests={4}
              category="Lap Pool"
            />
          </div>
        </div>
      </div>
    );
  }

  return <ListingWizard />;
}

const Index = () => (
  <ListingProvider>
    <PageRouter />
  </ListingProvider>
);

export default Index;

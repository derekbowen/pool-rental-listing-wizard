import { ListingProvider } from "@/contexts/ListingContext";
import ListingWizard from "@/components/listing/ListingWizard";

const Index = () => (
  <ListingProvider>
    <ListingWizard />
  </ListingProvider>
);

export default Index;

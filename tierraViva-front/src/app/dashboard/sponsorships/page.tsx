
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function SponsorshipsPage() {
    // Mock data - normally fetched based on user
    const sponsorships = [];

    if (sponsorships.length === 0) {
        return (
            <div className="text-center py-12 space-y-4">
                <h2 className="text-xl font-semibold">No tienes apadrinamientos activos</h2>
                <p className="text-muted-foreground">
                    Apadrina a un animal y ayúdalo a tener una vida mejor.
                </p>
                <Link href="/animals">
                    <Button>Ver animales para apadrinar</Button>
                </Link>
            </div>
        );
    }

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">Mis Apadrinamientos</h1>
            {/* List sponsorships here */}
        </div>
    );
}

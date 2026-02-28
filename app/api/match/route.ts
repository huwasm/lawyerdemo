import { NextRequest, NextResponse } from "next/server";
import { getOpenMatters, getContact } from "@/lib/clio";

interface MatchRequest {
  all_persons: { name: string; age: number; sex: string }[];
  vehicle_1: { driver_name_first: string; driver_name_last: string };
  vehicle_2: { driver_name_first: string; driver_name_last: string };
}

function normalizeName(name: string): string {
  return name.trim().toLowerCase().replace(/[^a-z\s]/g, "");
}

function namesMatch(
  clioName: string,
  firstName: string,
  lastName: string
): boolean {
  const clio = normalizeName(clioName);
  const first = normalizeName(firstName);
  const last = normalizeName(lastName);

  // Clio format: "First Last"
  return clio === `${first} ${last}` || clio.includes(first) && clio.includes(last);
}

export async function POST(req: NextRequest) {
  try {
    const body: MatchRequest = await req.json();

    const matters = await getOpenMatters();

    // Try to match client name against extracted names
    const matches: {
      matter: (typeof matters)[0];
      matchedVehicle: 1 | 2;
      clientFirst: string;
      clientLast: string;
      defendantFirst: string;
      defendantLast: string;
    }[] = [];

    for (const matter of matters) {
      if (!matter.client?.name) continue;

      // Check Vehicle 1
      if (
        namesMatch(
          matter.client.name,
          body.vehicle_1.driver_name_first,
          body.vehicle_1.driver_name_last
        )
      ) {
        matches.push({
          matter,
          matchedVehicle: 1,
          clientFirst: body.vehicle_1.driver_name_first,
          clientLast: body.vehicle_1.driver_name_last,
          defendantFirst: body.vehicle_2.driver_name_first,
          defendantLast: body.vehicle_2.driver_name_last,
        });
      }

      // Check Vehicle 2
      if (
        namesMatch(
          matter.client.name,
          body.vehicle_2.driver_name_first,
          body.vehicle_2.driver_name_last
        )
      ) {
        matches.push({
          matter,
          matchedVehicle: 2,
          clientFirst: body.vehicle_2.driver_name_first,
          clientLast: body.vehicle_2.driver_name_last,
          defendantFirst: body.vehicle_1.driver_name_first,
          defendantLast: body.vehicle_1.driver_name_last,
        });
      }
    }

    // Get contact email for matched matters
    const matchesWithEmail = await Promise.all(
      matches.map(async (m) => {
        let clientEmail =
          process.env.HACKATHON_EMAIL ||
          "talent.legal-engineer.hackathon.automation-email@swans.co";

        try {
          const contact = await getContact(m.matter.client.id);
          if (contact.email_addresses?.length > 0) {
            // Try to get the actual address string
            const addr = contact.email_addresses[0].address;
            if (addr) clientEmail = addr;
          }
        } catch {
          // Fall back to hardcoded email
        }

        return { ...m, clientEmail };
      })
    );

    return NextResponse.json({
      success: true,
      matchCount: matchesWithEmail.length,
      matches: matchesWithEmail,
    });
  } catch (error) {
    console.error("Match error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Matching failed" },
      { status: 500 }
    );
  }
}

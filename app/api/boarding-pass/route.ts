import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/app/lib/supabase/client";
import type { BoardingPass, ApiResponse } from "@/app/types";

export async function POST(req: NextRequest) {
    const { confirmation_no, email } = await req.json();

    const supabase = await createClient();

    const { data: booking, error } = await supabase
        .from("bookings")
        .select("*, flight:flight_id(*, origin_airport:origin(iata,name,city), destination_airport:destination(iata,name,city))")
        .eq("confirmation_no", confirmation_no.toUpperCase())
        .eq("email", email.toLowerCase())
        .single();

        if (error || !booking) {
            return NextResponse.json<ApiResponse<null>>({ data: null, error: "Booking not found"}, { status: 404});
        }

        if (booking.status !== "confirmed") {
            return NextResponse.json<ApiResponse<null>>({ data: null, error: "Only confirmed bookings can be checked in" }, { status: 409 });
        }

        const gates = ["A1", "A2", "B1", "B2", "B3", "C1", "C2"];
        const hashVal = booking.id.split("").reduce((a: number, c: string) => a + c.charCodeAt(0), 0);
        const gate = gates[hashVal % gates.length];
        const group = booking.cabin_class === "first" ? "Group 1" : booking.cabin_class === "business" ? "Group 2" : "Group 3";
        const boardingTime = new Date(new Date(booking.flight.departs_at).getTime() - 30 * 60000).toISOString();

        await supabase.from("bookings").update({
            checked_in: true,
            check_in_at: new Date().toISOString(),
            gate,
            boarding_group: group,
        }).eq("id", booking.id);
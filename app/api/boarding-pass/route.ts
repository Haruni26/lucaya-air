import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/app/lib/supabase/client";
import type { BoardingPass, ApiResponse } from "@/app/types";

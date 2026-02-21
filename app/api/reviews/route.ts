/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

// In a full implementation, these would use Supabase queries
// For now, we return mock data to make the UI functional

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const mediaId = searchParams.get("mediaId");

  if (!mediaId) {
    return NextResponse.json({ error: "Missing mediaId" }, { status: 400 });
  }

  // Mock reviews — in production, query from user_reviews table
  const reviews: any[] = [];

  return NextResponse.json({ reviews, total: reviews.length });
}

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { mediaId, overall_rating, sub_ratings, title, body: reviewBody, contains_spoilers } = body;

    if (!mediaId || !overall_rating) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (overall_rating < 1 || overall_rating > 10) {
      return NextResponse.json({ error: "Rating must be between 1-10" }, { status: 400 });
    }

    // In production, insert into user_reviews table
    const review = {
      id: `review-${Date.now()}`,
      user_id: userId,
      media_id: mediaId,
      overall_rating,
      sub_ratings: sub_ratings || {},
      title: title || null,
      body: reviewBody,
      contains_spoilers: contains_spoilers || false,
      upvotes: 0,
      downvotes: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    console.error("Review creation error:", error);
    return NextResponse.json({ error: "Failed to create review" }, { status: 500 });
  }
}

// Vote on a review
export async function PATCH(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { reviewId, vote } = await request.json();

    if (!reviewId || !["up", "down"].includes(vote)) {
      return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
    }

    // In production, upsert into review_votes table
    return NextResponse.json({ success: true, reviewId, vote });
  } catch (error) {
    console.error("Review vote error:", error);
    return NextResponse.json({ error: "Failed to vote" }, { status: 500 });
  }
}

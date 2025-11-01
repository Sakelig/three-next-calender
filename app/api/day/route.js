export async function GET() {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    if (!apiUrl) {
      throw new Error('WAIFU_API_URL environment variable is not set');
    }

    const response = await fetch(apiUrl + "/api/day");

    if (!response.ok) {
      throw new Error('Failed to fetch waifu data');
    }

    const dayResponse = await response.json();

    return Response.json({
      message: "Hello World",
      dayData: dayResponse
    });
  } catch (error) {
    console.error('Error fetching waifu data:', error);

    return Response.json(
      {
        message: "Hello World",
        error: "Failed to fetch waifu data"
      },
      { status: 500 }
    );
  }
}

// pull user data from login to display on profile page
import { FastifyPluginAsync } from "fastify";

const profile: FastifyPluginAsync = async (fastify, _opts): Promise<void> => {
	// GET /api/profile
	// - If caller provides `X-User-Id` header or `?id=` query param, try to load that user from Prisma
	// - Otherwise return a demo/mock user object to support frontend development
	fastify.get("/api/profile", async (request, reply) => {
		// If the authentication plugin sets `request.user`, prefer that
		const authUser = (request as any).user as any | undefined;
		if (authUser) {
			// Preferred identifier is `username` (frontend). In the Prisma schema the
			// corresponding column is `name`, so try that first. Fall back to id/email.
			let userFromAuth: any | null = null;
			if (authUser.username) {
				// `name` is not a unique field in the schema, so use findFirst to locate
				// a user matching the provided username.
				userFromAuth = await fastify.prisma.user.findFirst({
					where: { name: String(authUser.username) },
					include: { reviews: { include: { show: true }, orderBy: { createdAt: "desc" } } },
				});
			}
			if (!userFromAuth && authUser.id) {
				userFromAuth = await fastify.prisma.user.findUnique({
					where: { id: Number(authUser.id) },
					include: { reviews: { include: { show: true }, orderBy: { createdAt: "desc" } } },
				});
			}
			if (!userFromAuth && authUser.email) {
				userFromAuth = await fastify.prisma.user.findUnique({
					where: { email: String(authUser.email) },
					include: { reviews: { include: { show: true }, orderBy: { createdAt: "desc" } } },
				});
			}

			if (userFromAuth) {
				const reviews = userFromAuth.reviews.map((r: any) => ({
					id: r.id,
					showId: r.showId,
					showTitle: r.show?.title ?? null,
					showImage: null,
					rating: r.rating,
					reviewText: r.comment ?? "",
					date: r.createdAt.toISOString().split("T")[0],
					likes: 0,
				}));

				return {
					id: userFromAuth.id,
					username: userFromAuth.name ?? userFromAuth.email.split("@")[0],
					email: userFromAuth.email,
					joinDate: userFromAuth.createdAt.toISOString().split("T")[0],
					bio: "",
					stats: { reviews: reviews.length, favorites: 0, watchlist: 0 },
					reviews,
					favorites: [],
					watchlist: [],
				};
			}
		}

		// Fallbacks: X-User-Id header or ?id= query
		const headerId = request.headers["x-user-id"] as string | undefined;
		const queryId = (request.query as any)?.id;
		const maybeId = headerId ?? queryId;
		const userId = Number(maybeId);

		if (Number.isInteger(userId) && userId > 0) {
			const user = await fastify.prisma.user.findUnique({
				where: { id: userId },
				include: { reviews: { include: { show: true }, orderBy: { createdAt: "desc" } } },
			});

			if (!user) {
				reply.code(404);
				return { error: "User not found" };
			}

			const reviews = user.reviews.map((r: any) => ({
				id: r.id,
				showId: r.showId,
				showTitle: r.show?.title ?? null,
				showImage: null,
				rating: r.rating,
				reviewText: r.comment ?? "",
				date: r.createdAt.toISOString().split("T")[0],
				likes: 0,
			}));

			return {
				id: user.id,
				username: user.name ?? user.email.split("@")[0],
				email: user.email,
				joinDate: user.createdAt.toISOString().split("T")[0],
				bio: "",
				stats: { reviews: reviews.length, favorites: 0, watchlist: 0 },
				reviews,
				favorites: [],
				watchlist: [],
			};
		}

		// Demo fallback when no user id provided (useful for frontend development)
		return {
			id: 1,
			username: "tv_enthusiast",
			email: "user@example.com",
			joinDate: "2023-01-01",
			bio: "Love watching TV shows and sharing my thoughts! Huge fan of sci-fi and drama series.",
			stats: {
				reviews: 2,
				favorites: 3,
				watchlist: 2,
			},
			reviews: [
				{
					id: 1,
					showId: 1,
					showTitle: "Breaking Bad",
					showImage: "https://via.placeholder.com/150x225/4F46E5/FFFFFF?text=Breaking+Bad",
					rating: 5,
					reviewText:
						"Absolutely phenomenal! One of the best TV shows ever made. The character development and storytelling are unmatched.",
					date: "2024-01-15",
					likes: 24,
				},
				{
					id: 2,
					showId: 2,
					showTitle: "Stranger Things",
					showImage: "https://via.placeholder.com/150x225/7C3AED/FFFFFF?text=Stranger+Things",
					rating: 4,
					reviewText:
						"Great nostalgia vibes and excellent acting from the young cast. Season 1 was the strongest.",
					date: "2024-01-10",
					likes: 18,
				},
			],
			favorites: [
				{
					id: 1,
					title: "Breaking Bad",
					image: "https://via.placeholder.com/200x300/4F46E5/FFFFFF?text=Breaking+Bad",
					rating: 4.8,
				},
				{
					id: 3,
					title: "The Office",
					image: "https://via.placeholder.com/200x300/2563EB/FFFFFF?text=The+Office",
					rating: 4.7,
				},
				{
					id: 4,
					title: "Game of Thrones",
					image: "https://via.placeholder.com/200x300/DC2626/FFFFFF?text=Game+of+Thrones",
					rating: 4.5,
				},
			],
			watchlist: [
				{
					id: 7,
					title: "The Last of Us",
					image: "https://via.placeholder.com/200x300/EA580C/FFFFFF?text=Last+of+Us",
					rating: 4.9,
				},
				{
					id: 8,
					title: "Wednesday",
					image: "https://via.placeholder.com/200x300/64748B/FFFFFF?text=Wednesday",
					rating: 4.3,
				},
			],
		};
	});
};

export default profile;
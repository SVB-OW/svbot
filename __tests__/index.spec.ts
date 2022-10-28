import { Message } from 'discord.js'
import { rankResolver, sortPlayers } from "../src/helpers";
import { Lobby, Region, Signup } from "../src/types"

describe("Support Functions", () => {

	const eu_player = {
		gamesPlayed: 0,
		region: Region.EU
	} as Signup
	const na_player = {
		gamesPlayed: 0,
		region: Region.NA
	} as Signup
	const eu_lobby = {
		region: Region.EU
	} as Lobby

	it("should sort Region", () => {
		expect(sortPlayers(eu_player, na_player, eu_lobby)).toBe(-1)
		expect(sortPlayers(na_player, eu_player, eu_lobby)).toBe(1)
	});

	it("should sort gamesPlayed", () => {
		expect(sortPlayers(eu_player, na_player, eu_lobby)).toBe(-1)
		expect(sortPlayers(na_player, eu_player, eu_lobby)).toBe(1)
		eu_player.gamesPlayed = 1
		expect(sortPlayers(eu_player, na_player, eu_lobby)).toBe(1)
		expect(sortPlayers(na_player, eu_player, eu_lobby)).toBe(-1)
	});

	it("should resolve rank names", () => {
		expect(rankResolver("b")).toBe("BRONZE")
		expect(rankResolver("bronze")).toBe("BRONZE")
		expect(rankResolver("s")).toBe("SILVER")
		expect(rankResolver("silver")).toBe("SILVER")
		expect(rankResolver("g")).toBe("GOLD")
		expect(rankResolver("gold")).toBe("GOLD")
		expect(rankResolver("p")).toBe("PLATINUM")
		expect(rankResolver("plat")).toBe("PLATINUM")
		expect(rankResolver("platinum")).toBe("PLATINUM")
		expect(rankResolver("d")).toBe("DIAMOND")
		expect(rankResolver("dia")).toBe("DIAMOND")
		expect(rankResolver("diamond")).toBe("DIAMOND")
		expect(rankResolver("m")).toBe("MASTER")
		expect(rankResolver("master")).toBe("MASTER")
		expect(rankResolver("gm")).toBe("GRANDMASTER")
		expect(rankResolver("grandmaster")).toBe("GRANDMASTER")
	});
})

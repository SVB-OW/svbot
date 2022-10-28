import { TextChannel, Role } from 'discord.js'
import { rankResolver, sortPlayers } from "../src/helpers";
import { ICommandInteraction, Lobby, Region, Signup } from "../src/types"
import { getRankRoles, getSignupChannel } from "../src/validations";

describe("Support functions", () => {

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

	// define some channels we use
	const signupChannel = {
		name: 'signup'
	} as Partial<TextChannel>
	const matchmakerChannel = {
		name: 'matchmaker'
	} as Partial<TextChannel>
	const pingsChannel = {
		name: 'player-pings'
	} as Partial<TextChannel>
	const lobbyChannel = {
		name: 'waiting lobby'
	} as Partial<TextChannel>
	const channelCache = [signupChannel, matchmakerChannel, pingsChannel, lobbyChannel]

	// define some roles we use
	const bronzeRole = {
		name: 'Gauntlet Bronze'
	} as Partial<Role>
	const silverRole = {
		name: 'Gauntlet Silver'
	} as Partial<Role>
	const goldRole = {
		name: 'Gauntlet Gold'
	} as Partial<Role>
	const platRole = {
		name: 'Gauntlet Platinum'
	} as Partial<Role>
	const diaRole = {
		name: 'Gauntlet Diamond'
	} as Partial<Role>
	const masterRole = {
		name: 'Gauntlet Master'
	} as Partial<Role>
	const gmRole = {
		name: 'Gauntlet GrandMaster'
	} as Partial<Role>
	const rolesCache = [bronzeRole, silverRole, goldRole, platRole, diaRole, masterRole, gmRole]

	// fake an interaction and define the caches
	const ia = {
		guild: {
			channels: {
				cache: channelCache
			},
			roles: {
				cache: rolesCache
			}
		}
	} as unknown as ICommandInteraction

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

	it("should find the signup channel", () => {
		expect(getSignupChannel(ia)).toBe(signupChannel)
	})

	it("should find the rank roles", () => {
		expect(Object.keys(getRankRoles(ia))).toHaveLength(7)
	})
})

// describe("Command Functions", () => {
// 	beforeEach(() => {
// 		jest.clearAllMocks();
// 	});
//
// 	const client = jest.fn()
//
// 	const ia = ({
// 		channel: {
// 			send: jest.fn(),
// 		},
// 		content: "",
// 		author: {
// 			bot: false,
// 		},
// 	} as unknown) as Message;
//
// 	it("should send error messages quietly", async () => {
// 		await interaction()
// 		expect(ia.reply).toBeCalledWith("moo")
// 	})
// })

// refs:
// https://jestjs.io/docs/expect
// https://www.youtube.com/watch?v=5TjXmsJtWZc
// https://github.com/stuyy/jest-unit-tests-demo/blob/master/__tests__/index.spec.ts

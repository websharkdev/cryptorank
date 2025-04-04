import type { CheerioAPI } from "cheerio";

import axios from "axios";
import { load } from "cheerio";
import { Bot } from "grammy";

import { removeSpacing } from "./api/(lib)/constants";
import { getTwitterScore } from "./api/(lib)/twitter-score";
import env from "./api/env";

const CBot = new Bot(env.BOT_TOKEN);

interface ILink {
type: "x_twitter" | "discord" | "github" | "linkedin" | "medium" | "other";
link: string;
}

const socials = ["website", "x_twitter", "discord", "github", "linkedin", "medium", "galxe", "other"];

CBot.command("start", ctx => ctx.reply("Welcome! Up and running!"));

// CBot.on("message", ctx => ctx.reply("Got another message!"));

function getDescription(doc: CheerioAPI) {
const descriptions: string[] = [];

    doc("#coin-description-block .hmUhgK p").each((_, el) => {
        descriptions.push(doc(el).text().trim());
    });

    return descriptions[0];

}

async function getLinks(doc: CheerioAPI) {
const links: ILink[] = [];

    doc("#CoinGeneralInfo .links a").each((_, el) => {
        const link = doc(el);

        const current = socials.find(i => i.startsWith(removeSpacing(link.text())));

        return links.push({
            link: link.attr("href") || "N/A",
            type: (current || "other") as ILink["type"],
        });
    });

    const twitterHandle = links.find(l => l.type === "x_twitter")?.link.split("/").pop();
    const score = await getTwitterScore(twitterHandle || "monad_xyz");

    return links.map((l) => {
        if (l.type === "x_twitter") {
            return {
                ...l,
                score,
            };
        }

        return {
            ...l,
            score: {},
        };
    });

}

CBot.on("message", async (ctx) => {
const projectName: string = ctx.message.text?.toString().split(" ").join("\_").toLocaleLowerCase() || "monad";

    const url = `https://cryptorank.io/price/${projectName}`;

    try {
        const { data, status } = await axios.get(url, {
            headers: {
                "User-Agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3",
            },
        });

        if (status !== 200) {
            throw new Error("FAILD");
        }

        const doc = load(data) as CheerioAPI;

        const description = getDescription(doc);
        // const team = await getTeam(removeSpacing(params.title));
        // const tags = await getTags(removeSpacing(params.title));
        // const investors = await getInvestors(removeSpacing(params.title));
        const links = await getLinks(doc);

        const title = `🤖 ${ctx.message.text?.toString()} 🤖`;
        const clinks = links.map(link => `🔗 [${link.type === "x_twitter" ? "X (Twitter)" : link.type}](${link.link})`).join("\n");
        const twitter = links.find(l => l.type === "x_twitter");
        const cscore = `TwitterScore: ${twitter?.score.score || 0}`;

        return ctx.api.sendMessage(`${title}\n\n${description}\n\n${clinks}\n\n${cscore}`);
    }
    catch (error) {
        console.log("❌ Ooops!", error);
        return ctx.reply(JSON.stringify({}));
    }

});

CBot.start();

export default CBot;

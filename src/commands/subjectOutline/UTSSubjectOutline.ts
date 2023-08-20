import {
  CommandInteraction,
  Client,
  ApplicationCommandOptionType,
  Attachment,
} from "discord.js";
import { Command } from "../../Command";
import subjectMapJSON from "./suggestions.json";
import axios from "axios";

// We need to read suggestions.json and convert this into a key value hashmap
// This is so we can get the course name from the course code
const subjectMap: Map<number, string> = new Map<number, string>();

const initMap = () => {
  // Convert the JSON into a hashmap
  let subjectMapJSON: any = require("./suggestions.json");
  for (const subject of subjectMapJSON.subjects) {
    subjectMap.set(subject.code, subject.name);
  }

  console.log("Subject Map initialised");
  console.table(subjectMap.get(17527));
};

initMap();

export const UTSSubjectOutline: Command = {
  name: "subjectoutline",
  description: "Returns a link to the specified UTS Subject Outline",
  options: [
    {
      name: "subjectcode",
      description: "The subject code of the subject outline you want to find",
      required: true,
      type: ApplicationCommandOptionType.Integer,
    },
    {
      name: "session",
      description: "The session of the subject outline you want to find",
      required: true,
      type: ApplicationCommandOptionType.String,
      choices: [
        {
          name: "Autumn",
          value: "AUT",
        },
        {
          name: "Spring",
          value: "SPR",
        },
        {
          name: "Summer",
          value: "SUM",
        },
      ],
    },
    {
      name: "year",
      description: "The year of the subject outline you want to find",
      required: true,
      type: ApplicationCommandOptionType.Integer,
    },
  ],
  run: async (client: Client, interaction: CommandInteraction) => {
    // Get the user's input
    const courseCode: string = interaction.options
      .get("subjectcode", true)
      .value?.toString()!;

    const session: string = interaction.options
      .get("session", true)
      .value?.toString()!;

    const year: string = interaction.options
      .get("year", true)
      .value?.toString()!;

    // If course code isnt an integer, return an error
    if (isNaN(parseInt(year))) {
      await interaction.followUp({
        ephemeral: true,
        content: "Year must be a number",
      });
      return;
    }

    // Now just find the subject name as a string
    const courseName: string | undefined = subjectMap.get(parseInt(courseCode));

    if (!courseCode) {
      await interaction.followUp({
        ephemeral: true,
        content: "Invalid subject code",
      });
      return;
    }

    try {
      const outlineURL: string = await getSubjectOutlineURL(
        courseCode,
        session,
        year
      );

      await interaction.followUp({
        files: [
          {
            attachment: outlineURL,
            name: "subjectoutline.pdf",
          },
        ],
        content: `Subject Outline for ${courseCode} - ${courseName} (${session} ${year})`,
      });
    } catch (error: any) {
      let errorMessage: string = error.message;

      await interaction.followUp({
        ephemeral: true,
        content: errorMessage,
      });

      return;
    }

    // const outlineURL: string = getSubjectOutlineURL(courseCode, session, year);

    // console.log(`Subject Outline URL: ${outlineURL}`);
  },
};

const getSubjectOutlineURL = async (
  courseCode: string,
  session: string,
  year: string
) => {
  let url: string = `https://cis-admin-api.uts.edu.au/subject-outlines/index.cfm/PDFs?lastGenerated=true&lastGenerated=true&subjectCode=${courseCode}&year=${year}&session=${session}&mode=standard&location=city#view=FitH`;

  let response = await axios.get(url, {
    responseType: "document",
  });

  if (response.data.includes("This subject outline is not yet available.")) {
    throw new Error("Subject Outline not found");
  }

  if (response.status != 200) {
    throw new Error("Network Error");
  }

  return url;
};

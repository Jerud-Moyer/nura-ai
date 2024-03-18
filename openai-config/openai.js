import OpenAI from "openai";

const configuration = {
  organization: 'org-1YBPPDQNKVIfjpAZJXqomVjs',
  apiKey: process.env.OPENAI_API_KEY,
}

const openai = new OpenAI({
  configuration
});

export default openai

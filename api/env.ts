import { config } from 'dotenv'
import { expand } from 'dotenv-expand'
import { z } from 'zod'

expand(config())

const ENVSchema = z.object({
  BOT_TOKEN: z.string(),
  WEBHOOK_URL: z.string().url(),
})

export type env = z.infer<typeof ENVSchema>

// eslint-disable-next-line ts/no-redeclare, node/no-process-env
const { data: env, error } = ENVSchema.safeParse(process.env)

if (error) {
  console.error('❌ Invalid env:')
  console.error(JSON.stringify(error.flatten().fieldErrors, null, 2))
  process.exit(1)
}

export default env!

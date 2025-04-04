import type { CheerioAPI } from 'cheerio'

import axios from 'axios'
import { load } from 'cheerio'

import { removeSpacing } from './constants'

export async function getTwitterScore(twitterHandle: string) {
  const url = `https://twitterscore.io/twitter/${removeSpacing(twitterHandle)}/overview/`
  const api_url = `https://twitterscore.io/twitter/graph/ajax/?accountSlug=${removeSpacing(twitterHandle)}`

  const { data, status } = await axios.get(url, {
    headers: {
      'User-Agent':
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3',
    },
  })

  const { data: api } = await axios(api_url, {
    headers: {
      'User-Agent':
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3',
    },
  })

  if (status !== 200) {
    throw new Error('FAILD')
  }

  const doc = load(data) as CheerioAPI

  const getFollowers = () => {
    const followers: {
      link: string
      label: string
      value: string
      score: string
    }[] = []

    doc('.followed-accounts-wrap-block a').each((_, el) => {
      const current = doc(el)

      followers.push({
        label: current.find('.user-name span').text().trim(),
        value: removeSpacing(current.find('.user-name span').text()),
        link: current.attr('href')?.split('/twitter/')[1].replace('/', '') as string,
        score: current.find('span.score').text().trim(),
      })
    })

    return followers
  }

  const result = {
    score: api.scores.pop().value,
    type: doc('.count-wrapper p').text().trim(),
    followers_count: api.followers.reverse().find((entry: { value: number | null }) => entry.value !== null).value,
    followers: getFollowers(),
  }

  return result
}

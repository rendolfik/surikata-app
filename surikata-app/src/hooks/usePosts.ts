import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { lsGet, lsSet } from '../lib/storage'
import { genId } from '../lib/utils'
import type { Post } from '../types'

const KEY = 'suri_posts'

// posts stored as { [dateKey]: Post[] }
type PostsMap = Record<string, Post[]>

function load(): PostsMap {
  return lsGet<PostsMap>(KEY, {})
}

export function usePostsMap() {
  return useQuery({ queryKey: ['posts'], queryFn: load, staleTime: Infinity })
}

export function useCreatePost() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: Omit<Post, 'id'>) => {
      const map = load()
      const item: Post = { ...data, id: genId() }
      if (!map[data.datum]) map[data.datum] = []
      map[data.datum] = [item, ...map[data.datum]]
      lsSet(KEY, map)
      return item
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['posts'] }),
  })
}

export function useUpdatePost() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, datum, ...data }: Partial<Post> & { id: string; datum: string }) => {
      const map = load()
      if (map[datum]) {
        const idx = map[datum].findIndex((p) => p.id === id)
        if (idx > -1) map[datum][idx] = { ...map[datum][idx], ...data, datum }
      }
      lsSet(KEY, map)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['posts'] }),
  })
}

export function useDeletePost() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, datum }: { id: string; datum: string }) => {
      const map = load()
      if (map[datum]) {
        map[datum] = map[datum].filter((p) => p.id !== id)
        if (!map[datum].length) delete map[datum]
      }
      lsSet(KEY, map)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['posts'] }),
  })
}

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { lsGet, lsSet } from '../lib/storage'
import { genId } from '../lib/utils'
import type { Todo } from '../types'

const KEY = 'suri_todos'

function load(): Todo[] {
  return lsGet<Todo[]>(KEY, [])
}

export function useTodos() {
  return useQuery({ queryKey: ['todos'], queryFn: load, staleTime: Infinity })
}

export function useCreateTodo() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: Omit<Todo, 'id'>) => {
      const list = load()
      const item: Todo = { ...data, id: genId() }
      lsSet(KEY, [item, ...list])
      return item
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['todos'] }),
  })
}

export function useUpdateTodo() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<Todo> & { id: string }) => {
      const list = load()
      const idx = list.findIndex((t) => t.id === id)
      if (idx > -1) list[idx] = { ...list[idx], ...data }
      lsSet(KEY, list)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['todos'] }),
  })
}

export function useDeleteTodo() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      lsSet(KEY, load().filter((t) => t.id !== id))
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['todos'] }),
  })
}

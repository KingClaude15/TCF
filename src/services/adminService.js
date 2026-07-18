import { supabase } from '../lib/supabaseClient'

async function callAdminUsers(payload) {
  const { data, error } = await supabase.functions.invoke('admin-users', { body: payload })
  if (error) throw error
  if (data?.error) throw new Error(data.error)
  return data
}

export const listAllUsers = () => callAdminUsers({ action: 'list' }).then((d) => d.users)

export const createUser = (email, password, fullName, role = 'student') =>
  callAdminUsers({ action: 'create', email, password, fullName, role })

export const setUserStatus = (userId, status) => callAdminUsers({ action: 'setStatus', userId, status })

export const setUserRole = (userId, role) => callAdminUsers({ action: 'setRole', userId, role })

export const deleteUser = (userId) => callAdminUsers({ action: 'delete', userId })

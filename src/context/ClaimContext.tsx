import React, { createContext, useContext, useState, useEffect } from 'react'
import type { ClaimItem, Need } from '../lib/types'

interface ClaimContextType {
  claimItems: ClaimItem[]
  addToClaimList: (need: Need, quantity: number, additionalInfo: Partial<ClaimItem>) => void
  removeFromClaimList: (needId: string) => void
  updateClaimItem: (needId: string, updates: Partial<ClaimItem>) => void
  clearClaimList: () => void
  getTotalItems: () => number
}

const ClaimContext = createContext<ClaimContextType | undefined>(undefined)

const STORAGE_KEY = 'disaster-relief-claim-items'

export function ClaimProvider({ children }: { children: React.ReactNode }) {
  const [claimItems, setClaimItems] = useState<ClaimItem[]>([])

  // 從 localStorage 載入認領清單
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        setClaimItems(JSON.parse(saved))
      } catch (error) {
        console.error('Failed to load claim items:', error)
      }
    }
  }, [])

  // 儲存到 localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(claimItems))
  }, [claimItems])

  const addToClaimList = (need: Need, quantity: number, additionalInfo: Partial<ClaimItem> = {}) => {
    // 檢查是否已存在
    const existingIndex = claimItems.findIndex(item => item.needId === need.id)
    
    if (existingIndex >= 0) {
      // 更新現有項目
      const updated = [...claimItems]
      updated[existingIndex] = {
        ...updated[existingIndex],
        quantity,
        ...additionalInfo
      }
      setClaimItems(updated)
    } else {
      // 新增項目
      const newItem: ClaimItem = {
        needId: need.id,
        needType: need.needType,
        title: need.title,
        category: need.category,
        quantity,
        unit: need.unit,
        note: '',
        ...additionalInfo
      }
      setClaimItems([...claimItems, newItem])
    }
  }

  const removeFromClaimList = (needId: string) => {
    setClaimItems(claimItems.filter(item => item.needId !== needId))
  }

  const updateClaimItem = (needId: string, updates: Partial<ClaimItem>) => {
    setClaimItems(claimItems.map(item => 
      item.needId === needId ? { ...item, ...updates } : item
    ))
  }

  const clearClaimList = () => {
    setClaimItems([])
    localStorage.removeItem(STORAGE_KEY)
  }

  const getTotalItems = () => {
    return claimItems.length
  }

  return (
    <ClaimContext.Provider value={{
      claimItems,
      addToClaimList,
      removeFromClaimList,
      updateClaimItem,
      clearClaimList,
      getTotalItems
    }}>
      {children}
    </ClaimContext.Provider>
  )
}

export function useClaimContext() {
  const context = useContext(ClaimContext)
  if (context === undefined) {
    throw new Error('useClaimContext must be used within a ClaimProvider')
  }
  return context
}



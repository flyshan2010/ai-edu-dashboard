import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

// Web API key 為公開可內嵌之值（非機密），實際存取由 Firestore 安全規則把關。
const firebaseConfig = {
  apiKey: 'AIzaSyAbHzc8sJAOIpBSND40wqnbhXXqtbu0qqM',
  authDomain: 'ai-edu-dashboard-fly.firebaseapp.com',
  projectId: 'ai-edu-dashboard-fly',
  storageBucket: 'ai-edu-dashboard-fly.firebasestorage.app',
  messagingSenderId: '691690445037',
  appId: '1:691690445037:web:3328c43f6a5139ff1414e4',
}

export const firebaseApp = initializeApp(firebaseConfig)
export const auth = getAuth(firebaseApp)
export const db = getFirestore(firebaseApp)
export const projectId = firebaseConfig.projectId

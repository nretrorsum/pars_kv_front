import { Routes, Route } from 'react-router-dom'
import RealEstateAnalytics from './components/Analytics'
import Test from './components/Test'
import Header from './components/Header'

function App() {
  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-gray-900 via-purple-900 to-black">
      <Header />
      <main className="flex-1 overflow-y-auto">
        <Routes>
          <Route path="/" element={<RealEstateAnalytics />} />
          <Route path="/analytics" element={<RealEstateAnalytics />} />
          <Route path="/test" element={<Test />} />
          <Route path="/sales" element={
            <div className="text-white p-8 h-full">Сторінка продажу (в розробці)</div>
          } />
        </Routes>
      </main>
    </div>
  )
}

export default App
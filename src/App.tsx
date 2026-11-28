import { Page } from './components/Layout'
import { useRoute } from './lib/router'
import { Landing } from './views/Landing'
import { Workbench } from './views/Workbench'
import { Report } from './views/Report'
import { Deepdive } from './views/Deepdive'
import { Rewrite } from './views/Rewrite'
import { Resume } from './views/Resume'
import { Upload } from './views/Upload'
import { Analyze } from './views/Analyze'
import { Practice } from './views/Practice'
import { Method } from './views/Method'

export default function App() {
  const route = useRoute()

  let content
  switch (route) {
    case '/app':
      content = <Workbench />
      break
    case '/upload':
      content = <Upload />
      break
    case '/analyze':
      content = <Analyze />
      break
    case '/practice':
      content = <Practice key="personal" />
      break
    case '/practice/example':
      content = <Practice key="example" example />
      break
    case '/report':
      content = <Report />
      break
    case '/resume':
      content = <Resume />
      break
    case '/deepdive':
      content = <Deepdive />
      break
    case '/rewrite':
      content = <Rewrite />
      break
    case '/method':
      content = <Method />
      break
    case '/':
      content = <Landing />
      break
    default:
      content = <Landing />
  }

  return (
    <Page route={route}>{content}</Page>
  )
}

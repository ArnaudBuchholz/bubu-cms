'use strict'

import { load } from './loader'
import { log, serve } from 'reserve'

load(process.cwd())
  .then(loader => {
    const configuration = loader.buildReserveConfiguration()
    log(serve(configuration))
  })
  .catch(reason => console.error(reason))

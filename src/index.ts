#!/usr/bin/env node

'use strict'

import { load } from './loader/index'
import { log, serve } from 'reserve'

load(process.env.INIT_CWD ?? process.cwd())
  .then(loader => {
    const configuration = loader.buildReserveConfiguration()
    log(serve(configuration))
  })
  .catch(reason => console.error(reason))

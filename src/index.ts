'use strict'

import { load } from './loader'

load(process.cwd()).catch(reason => console.error(reason))

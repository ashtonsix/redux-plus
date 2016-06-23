import _ from 'lodash'
import {createEffect} from '../createEffect'
import {getModel} from '../getModel'
import {getGenerators} from '../getGenerators'

export const liftEffects = object =>
  createEffect(
    _.mapValues(object, getModel),
    ..._.flatten(_.values(object).map(getGenerators).filter(v => v))
  )

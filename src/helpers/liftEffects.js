import _ from 'lodash'
import {createEffect} from '../index'
import {getModel} from './getModel'
import {getEffect} from './getEffect'

export const liftEffects = object =>
  createEffect(
    _.mapValues(object, getModel),
    ..._.flatten(_.values(object).map(getEffect).filter(v => v))
  )

import polyfill from '@babel/polyfill';

import { map, forEach, reduce, assign, flatten } from 'lodash';
import when from 'when';
import meld from 'meld';

const Promise = when.promise;

import Graph from '../graph/Graph';
import GraphVertex from '../graph/GraphVertex';
import GraphEdge from '../graph/GraphEdge';
import depthFirstSearch from '../graph/algorithms/depthFirstSearch';

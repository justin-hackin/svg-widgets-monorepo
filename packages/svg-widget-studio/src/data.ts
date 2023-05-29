import { observable } from 'mobx';
import { widgetNameToIconMap, widgetNameToWidgetClassMap } from './internal/data';

observable(widgetNameToWidgetClassMap);

observable(widgetNameToIconMap);

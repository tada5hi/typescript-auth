/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ListLoadFn } from '@vue-layout/list-controls';
import type { PropType, SlotsType } from 'vue';
import { defineComponent, h } from 'vue';
import type { ListMeta, ListSearchSlotProps } from '../../core';
import { buildListSearch } from '../../core';

export const ListSearch = defineComponent({
    props: {
        // todo: add entity-key prop
        icon: {
            type: Boolean,
        },
        iconPosition: {
            type: String as PropType<'start' | 'end'>,
        },
        iconClass: {
            type: String,
        },
        busy: {
            type: Boolean,
        },
        load: {
            type: Function as PropType<ListLoadFn<ListMeta<any>>>,
        },
    },
    slots: Object as SlotsType<{
        default: ListSearchSlotProps<any>
    }>,
    setup(props, { slots }) {
        if (!props.load) {
            return h('div', [
                'The "load" property must be defined.',
            ]);
        }

        return () => buildListSearch({
            slots,
            icon: props.icon,
            iconPosition: props.iconPosition,
            busy: props.busy,
            load: props.load,
        });
    },
});

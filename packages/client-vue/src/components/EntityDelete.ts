/*
 * Copyright (c) 2022-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type {
    Component,
    PropType,
    VNodeArrayChildren,
    VNodeProps,
} from 'vue';
import {
    defineComponent, getCurrentInstance,
    h,
    mergeProps,
    ref, resolveDynamicComponent,
} from 'vue';
import type { DomainType } from '@authup/core';
import { useDomainAPI } from '@authup/core';
import { injectAPIClient } from '../core';
import { useTranslator } from '../core/translator';

enum ElementType {
    BUTTON = 'button',
    LINK = 'link',
    DROP_DOWN_ITEM = 'dropDownItem',
}

export default defineComponent({
    name: 'EntityDelete',
    props: {
        elementIcon: {
            type: String,
            default: 'fa-solid fa-trash',
        },
        withText: {
            type: Boolean,
            default: true,
        },
        elementType: {
            type: String as PropType<`${ElementType}`>,
            default: ElementType.BUTTON,
        },

        entityId: {
            type: String,
            required: true,
        },
        entityType: {
            type: String as PropType<`${DomainType}`>,
            required: true,
        },

        hint: {
            type: String,
            default: undefined,
        },
        locale: {
            type: String,
            default: undefined,
        },
    },
    emits: ['deleted', 'failed'],
    setup(props, ctx) {
        const apiClient = injectAPIClient();
        const instance = getCurrentInstance();
        const busy = ref(false);

        const submit = async () => {
            if (busy.value) return;

            const domainApi = useDomainAPI(apiClient, props.entityType);
            if (!domainApi) {
                return;
            }

            busy.value = true;

            try {
                if ('delete' in domainApi) {
                    const response = await domainApi.delete(props.entityId);
                    response.id = props.entityId;
                    ctx.emit('deleted', response);
                }
            } catch (e) {
                ctx.emit('failed', e);
            }

            busy.value = false;
        };

        const render = () => {
            let tag : Component | string = 'button';
            const data : VNodeProps = {};

            switch (props.elementType) {
                case ElementType.LINK:
                    tag = 'a';
                    break;
                case ElementType.DROP_DOWN_ITEM:
                    if (
                        instance &&
                        typeof instance.appContext.app.component('BDropdownItem') !== 'undefined'
                    ) {
                        tag = resolveDynamicComponent('BDropdownItem') as Component;
                    }
                    break;
            }

            let icon : VNodeArrayChildren = [];
            if (props.elementIcon) {
                icon = [
                    h('i', {
                        class: [props.elementIcon, {
                            'pe-1': props.withText,
                        }],
                    }),
                ];
            }

            let text : VNodeArrayChildren = [];
            if (props.withText) {
                text = [
                    useTranslator()
                        .getSync('app.delete.button', props.locale),
                ];
            }

            return h(
                tag as string,
                mergeProps({
                    disabled: busy.value,
                    onClick($event: any) {
                        $event.preventDefault();

                        return submit.apply(null);
                    },
                }, data),
                [
                    icon,
                    text,
                ],
            );
        };

        return () => render();
    },
});

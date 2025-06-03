<!-- 对话组件 -->

<script lang="ts">
import { computed } from 'vue';

const roles = {// 第一个值为主色,第二个值为背景色
    "random_play": { "铃": ["#254fff", "#fd802dbf"], "哲": ["#ffffff", "#fd802dbf"],"(蓝发少女)":["#254fff", "#fd802dbf"],"(灰发少年)":["#ffffff", "#fd802dbf"] },//录像店
    "cunning_hares": { "安比": ["#b3cc58", "#C8E16C33"], "比利": ["#cc4f4b", "#AF3E3A33"], "妮可": ["#cd8583", "#E6ADAA33"],"(粉毛长发少女)":["#cd8583", "#E6ADAA33"],"(白毛短发少女)":["#cc4f4b", "#AF3E3A33"]}, //狡兔屋
    "belobog_heavy_industries": {}, // 白祇重工
    "sons_of_calydon": {},// 卡吕冬之子
    "mockingbird": {}, //反舌鸟

    "other":{"npc":["dodgerblue","#7c7c7c46"]} //其他角色

}
export default {
    props: {
        role: {
            type: String,
            required: true,
        }
    },
    setup(props) {
        const roleColors = computed(() => {
            let colors = ['dodgerblue', "#7c7c7c46"]; // 默认颜色
            // role 直接为角色名称，阵营名称仅做分类用
            console.log(Object.keys(roles))
            for (const camp of Object.keys(roles)) {
                const campRoles = roles[camp];
                if (campRoles[props.role]) {
                    colors = campRoles[props.role];
                    break;
                }
            }
            return colors;
        });

        return { roleColors };
    }
}
</script>
<template>
    <div class="dialogue">
        <span class="character" :style="{ color: roleColors[0], background: roleColors[1] }">{{ role }}</span>
        <slot></slot>
    </div>
</template>

<style scoped>
.dialogue {
    margin: 1.2em 0;
    position: relative;
    padding-left: 1.5rem;
    font-weight: bold;
}

.dialogue::before {
    content: "“";
    position: absolute;
    left: 0;
    top: -0.5rem;
    font-size: 2.5rem;
    color: var(--main-color-1);
    font-family: Georgia, serif;
}

.character {
    display: inline-block;
    padding: 0.2rem 0.5rem;
    border-radius: 4px;
    font-size: 0.8rem;
    font-weight: bold;
    margin-right: 0.5rem;
}
</style>
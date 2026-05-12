import { provide, inject, type Ref } from 'vue'
import { ElMessageBox } from 'element-plus'

const KEY = Symbol('bvid-insert')

export function provideBvidInsert(editorRef: Ref<{ insert?: InsertFn } | null>) {
  const handler = async () => {
    try {
      const { value: bvid } = await ElMessageBox.prompt(
        '请输入你要嵌入的B站视频的BVID',
        '插入B站视频',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          inputPlaceholder: '例如：BVXXXXXXXXXX',
          inputValidator: (val) => {
            if (!val || !val.trim()) return '请输入BVID'
            return true
          }
        }
      )
      if (bvid && editorRef.value?.insert) {
        editorRef.value.insert((selectedText: string) => ({
          targetValue: selectedText ? `${selectedText}\n[[bvid:${bvid.trim()}]]` : `[[bvid:${bvid.trim()}]]`
        }))
      }
    } catch {
      // cancelled
    }
  }
  provide(KEY, handler)
}

export function useBvidInsert(): () => void {
  return inject(KEY, () => {
    console.warn('useBvidInsert: please call provideBvidInsert(editorRef) in the parent component')
  })
}

type InsertFn = (generator: (selectedText: string) => { targetValue: string }) => void

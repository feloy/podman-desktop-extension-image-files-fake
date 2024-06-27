/**********************************************************************
 * Copyright (C) 2022 Red Hat, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * SPDX-License-Identifier: Apache-2.0
 ***********************************************************************/
import * as extensionApi from '@podman-desktop/api';

// Activate the extension asynchronously
export async function activate(extensionContext: extensionApi.ExtensionContext): Promise<void> {

  const provider = extensionApi.provider.createImageFilesProvider({
    getFilesystemLayers: (_image: extensionApi.ImageInfo, _token?: extensionApi.CancellationToken): extensionApi.ImageFilesystemLayers => {
      const layer1: extensionApi.ImageFilesystemLayer = { id: '1234', createdBy: './first.sh' };
      provider
        .addDirectory(layer1, { path: 'tmp', mode: 0o1755 })
        .addFile(layer1, { path: 'tmp/to-del.txt', mode: 0o644, size: 20 })
        .addDirectory(layer1, { path: 'tmp/dir-to-empty', mode: 0o755 })
        .addFile(layer1, { path: 'tmp/dir-to-empty/file-to-del.txt', mode: 0o644, size: 100 })
        .addDirectory(layer1, { path: 'tmp/dir-to-empty/subdir', mode: 0o755 })
        .addFile(layer1, { path: 'tmp/dir-to-empty/subdir/other-file-to-del.txt', mode: 0o644, size: 35 })
        .addDirectory(layer1, { path: 'bin', mode: 0o755 })
        .addFile(layer1, { path: 'bin/ls', mode: 0o755, size: 32768 })
        .addFile(layer1, { path: 'bin/ls-suid', mode: 0o4755, size: 32768 })
        .addFile(layer1, { path: 'bin/ls-sgid', mode: 0o2755, size: 32768 });
        ;
      const layer2: extensionApi.ImageFilesystemLayer = { id: '1235', createdBy: './second.sh' };
      provider
        .addDirectory(layer2, { path: 'etc', mode: 0o755 })
        .addFile(layer2, { path: 'etc/hosts', mode: 0o644, size: 400 })
        .addSymlink(layer2, { path: 'etc/link', mode: 0o644, linkPath: '/etc/hosts' })
        .addWhiteout(layer2, 'tmp/to-del.txt')
        .addWhiteout(layer2, 'tmp/not-found')
        .addWhiteout(layer2, 'bin/ls-suid')
        .addWhiteout(layer2, 'bin/ls-sgid')
        .addOpaqueWhiteout(layer2, 'tmp/dir-to-empty');
      return {
        layers: [ layer1, layer2 ],
      };
    },
  });
  extensionContext.subscriptions.push(provider);
}

// Deactivate the extension
export function deactivate(): void {
  console.log('stopping extension');
}

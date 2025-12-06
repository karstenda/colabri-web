import { LoroMap } from 'loro-crdt';
import { AclLoroMap, StmtLoroDoc } from '../data/ColabDoc';
import { Permission } from '../../ui/data/Permission';
import ColabDocController from './ColabDocController';

class StatementDocController extends ColabDocController<StmtLoroDoc> {
  // Constructor
  constructor(loroDoc: StmtLoroDoc) {
    super(loroDoc);
  }

  /**
   * Update the statement element ACL map for a given language
   * @param langCode
   * @param newAcls
   */
  patchStmtElementAclMap(
    langCode: string,
    newAcls: Record<Permission, string[]>,
  ) {
    const contentMap = this.loroDoc.getMap('content');
    if (!contentMap) {
      throw new Error('Could not find content map in loroDoc');
    }
    const stmtElementMap = contentMap.get(langCode);
    if (!stmtElementMap) {
      throw new Error(
        `Could not find statement element for language ${langCode}`,
      );
    }
    const aclMap = stmtElementMap.getOrCreateContainer(
      'acl',
      new LoroMap(),
    ) as AclLoroMap;
    if (!aclMap) {
      throw new Error(`Could not find ACL map for language ${langCode}`);
    }
    this.patchAclMap(aclMap, newAcls);
  }

  /**
   * Get the statement element ACL map for a given language
   * @param langCode
   * @returns
   */
  getStmtElementAclMap(langCode: string): Record<Permission, string[]> {
    const contentMap = this.loroDoc.getMap('content');
    if (!contentMap) {
      throw new Error('Could not find content map in loroDoc');
    }
    const stmtElementMap = contentMap.get(langCode);
    if (!stmtElementMap) {
      throw new Error(
        `Could not find statement element for language ${langCode}`,
      );
    }
    const aclMap = stmtElementMap.get('acl');
    if (!aclMap) {
      return {} as Record<Permission, string[]>;
    }
    return aclMap.toJSON();
  }

  /**
   * Add a language to the statement document
   * @param langCode
   * @returns
   */
  addLanguage(langCode: string) {
    const contentMap = this.loroDoc.getMap('content');
    if (!contentMap) {
      throw new Error('Could not find content map in loroDoc');
    }
    // Create it in the loroDoc if it doesn't exist
    const stmtElementMap = contentMap.getOrCreateContainer(
      langCode,
      new LoroMap(),
    );
    const textElementMap = stmtElementMap.getOrCreateContainer(
      'textElement',
      new LoroMap(),
    );
    textElementMap.set('nodeName', 'doc');
  }

  /**
   * Remove a language from the statement document
   * @param langCode
   */
  removeLanguage(langCode: string) {
    const contentMap = this.loroDoc.getMap('content');
    if (!contentMap) {
      throw new Error('Could not find content map in loroDoc');
    }
    contentMap.delete(langCode);
  }
}
export default StatementDocController;

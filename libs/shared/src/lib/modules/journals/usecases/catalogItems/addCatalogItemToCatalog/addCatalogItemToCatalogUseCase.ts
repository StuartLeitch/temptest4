import {UseCase} from '../../../../../core/domain/UseCase';
import {Result} from '../../../../../core/logic/Result';
// import {UniqueEntityID} from '../../../../../core/domain/UniqueEntityID';

import {CatalogItem} from '../../../domain/CatalogItem';
import {CatalogRepoContract} from '../../../repos/catalogRepo';
// import {TextUtil} from '../../../../../utils/TextUtil';
// import {ParseUtils} from '../../../../../utils/ParseUtils';

// interface PriceRequestDTO {
//   amount: number;
//   currency: string;
// }

interface AddCatalogItemToCatalogUseCaseRequestDTO {
  type: string;
  price: number; // | PriceRequestDTO;
}

export class AddCatalogItemToCatalogUseCase
  implements
    UseCase<AddCatalogItemToCatalogUseCaseRequestDTO, Result<CatalogItem>> {
  private catalogRepo: CatalogRepoContract;

  constructor(catalogRepo: CatalogRepoContract) {
    this.catalogRepo = catalogRepo;
  }

  // private async getGenresFromDTO(artistGenres: string) {
  //   return (await this.genresRepo.findByIds(
  //     (ParseUtils.parseObject(artistGenres) as Result<GenresRequestDTO>)
  //       .getValue()
  //       .ids.map(genreId => GenreId.create(new UniqueEntityID(genreId)))
  //   )).concat(
  //     (ParseUtils.parseObject(artistGenres) as Result<GenresRequestDTO>)
  //       .getValue()
  //       .new.map(name => Genre.create(name).getValue())
  //   );
  // }

  // private async getArtist(
  //   request: AddVinylToCatalogUseCaseRequestDTO
  // ): Promise<Result<Artist>> {
  //   const {artistNameOrId, artistGenres} = request;
  //   const isArtistIdProvided = TextUtil.isUUID(artistNameOrId);

  //   if (isArtistIdProvided) {
  //     const artist = await this.artistRepo.findByArtistId(artistNameOrId);
  //     const found = !!artist;

  //     if (found) {
  //       return Result.ok<Artist>(artist);
  //     } else {
  //       return Result.fail<Artist>(
  //         `Couldn't find artist by id=${artistNameOrId}`
  //       );
  //     }
  //   } else {
  //     return Artist.create({
  //       name: ArtistName.create(artistNameOrId).getValue(),
  //       genres: await this.getGenresFromDTO(artistGenres as string)
  //     });
  //   }
  // }

  // private async getAlbum(
  //   request: AddVinylToCatalogUseCaseRequestDTO,
  //   artist: Artist
  // ): Promise<Result<Album>> {
  //   const {albumNameOrId, albumGenres, albumYearReleased} = request;
  //   const isAlbumIdProvided = TextUtil.isUUID(albumNameOrId);

  //   if (isAlbumIdProvided) {
  //     const album = await this.albumRepo.findAlbumByAlbumId(albumNameOrId);
  //     const found = !!album;

  //     if (found) {
  //       return Result.ok<Album>(album);
  //     } else {
  //       return Result.fail<Album>(`Couldn't find album by id=${album}`);
  //     }
  //   } else {
  //     return Album.create({
  //       name: albumNameOrId,
  //       artistId: artist.artistId,
  //       genres: await this.getGenresFromDTO(albumGenres as string),
  //       yearReleased: albumYearReleased
  //     });
  //   }
  // }

  public async execute(
    request: AddCatalogItemToCatalogUseCaseRequestDTO
  ): Promise<Result<CatalogItem>> {
    const {type, price} = request;

    // let artist: Artist;
    // let album: Album;

    try {
      // const artistOrError = await this.getArtist(request);
      // if (artistOrError.isFailure) {
      //   return Result.fail<Vinyl>(artistOrError.error);
      // } else {
      //   artist = artistOrError.getValue();
      // }

      // const albumOrError = await this.getAlbum(request, artist);
      // if (albumOrError.isFailure) {
      //   return Result.fail<Vinyl>(albumOrError.error);
      // } else {
      //   album = albumOrError.getValue();
      // }

      const catalogItemOrError = CatalogItem.create({
        type,
        price
        // artist: artist,
        // traderId: TraderId.create(new UniqueEntityID(traderId))
      });

      if (catalogItemOrError.isFailure) {
        return Result.fail<CatalogItem>(catalogItemOrError.error);
      }

      const catalogItem = catalogItemOrError.getValue();

      // This is where all the magic happens
      await this.catalogRepo.save(catalogItem);

      return Result.ok<CatalogItem>(catalogItem);
    } catch (err) {
      console.log(err);
      return Result.fail<CatalogItem>(err);
    }
  }
}
